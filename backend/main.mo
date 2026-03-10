import AccessControl "authorization/access-control";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";

actor {
  public type Client = {
    id : Nat;
    owner : Principal;
    name : Text;
    email : Text;
    phone : Text;
    notes : Text;
  };

  public type Payment = {
    id : Nat;
    owner : Principal;
    clientId : Nat;
    amount : Float;
    date : Time.Time;
    method : Text;
    notes : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  module Client {
    public func compare(client1 : Client, client2 : Client) : Order.Order {
      switch (Text.compare(client1.name, client2.name)) {
        case (#equal) { Nat.compare(client1.id, client2.id) };
        case (order) { order };
      };
    };
  };

  let accessControlState = AccessControl.initState();
  
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  let clients = Map.empty<Nat, Client>();
  let payments = Map.empty<Nat, Payment>();

  var nextClientId = 1;
  var nextPaymentId = 1;

  public shared ({ caller }) func addClient(name : Text, email : Text, phone : Text, notes : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add clients");
    };

    let clientId = nextClientId;
    nextClientId += 1;

    let newClient : Client = {
      id = clientId;
      owner = caller;
      name;
      email;
      phone;
      notes;
    };

    clients.add(clientId, newClient);
    clientId;
  };

  public shared ({ caller }) func updateClient(clientId : Nat, name : Text, email : Text, phone : Text, notes : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update clients");
    };

    switch (clients.get(clientId)) {
      case null {
        Runtime.trap("Client not found");
      };
      case (?client) {
        if (client.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own clients");
        };

        let updatedClient : Client = {
          id = clientId;
          owner = client.owner;
          name;
          email;
          phone;
          notes;
        };

        clients.add(clientId, updatedClient);
      };
    };
  };

  public shared ({ caller }) func deleteClient(clientId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete clients");
    };

    switch (clients.get(clientId)) {
      case null {
        Runtime.trap("Client not found");
      };
      case (?client) {
        if (client.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own clients");
        };

        clients.remove(clientId);

        // Also delete associated payments
        let paymentIds = List.empty<Nat>();
        payments.entries().forEach(
          func(entry) {
            if (entry.1.clientId == clientId) {
              paymentIds.add(entry.0);
            };
          }
        );

        paymentIds.forEach(func(id) { payments.remove(id) });
      };
    };
  };

  public query ({ caller }) func getClients() : async [Client] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filteredClients = List.empty<Client>();

    clients.values().forEach(
      func(client) {
        if (isAdmin or client.owner == caller) {
          filteredClients.add(client);
        };
      }
    );

    filteredClients.toArray().sort();
  };

  public query ({ caller }) func getClient(clientId : Nat) : async ?Client {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };

    switch (clients.get(clientId)) {
      case null { null };
      case (?client) {
        if (client.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?client;
        } else {
          Runtime.trap("Unauthorized: Can only view your own clients");
        };
      };
    };
  };

  public query ({ caller }) func searchClients(searchTerm : Text) : async [Client] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can search clients");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filteredClients = List.empty<Client>();

    clients.values().forEach(
      func(client) {
        let matchesSearch = client.name.contains(#text searchTerm) or 
                           client.email.contains(#text searchTerm) or 
                           client.phone.contains(#text searchTerm);
        let hasAccess = isAdmin or client.owner == caller;

        if (matchesSearch and hasAccess) {
          filteredClients.add(client);
        };
      }
    );

    filteredClients.toArray();
  };

  public shared ({ caller }) func addPayment(clientId : Nat, amount : Float, date : Time.Time, method : Text, notes : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add payments");
    };

    // Verify client exists and user has access
    switch (clients.get(clientId)) {
      case null {
        Runtime.trap("Client not found");
      };
      case (?client) {
        if (client.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only add payments to your own clients");
        };
      };
    };

    let paymentId = nextPaymentId;
    nextPaymentId += 1;

    let newPayment : Payment = {
      id = paymentId;
      owner = caller;
      clientId;
      amount;
      date;
      method;
      notes;
    };

    payments.add(paymentId, newPayment);
    paymentId;
  };

  public shared ({ caller }) func updatePayment(paymentId : Nat, amount : Float, date : Time.Time, method : Text, notes : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update payments");
    };

    switch (payments.get(paymentId)) {
      case null {
        Runtime.trap("Payment not found");
      };
      case (?payment) {
        if (payment.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own payments");
        };

        let updatedPayment : Payment = {
          id = paymentId;
          owner = payment.owner;
          clientId = payment.clientId;
          amount;
          date;
          method;
          notes;
        };

        payments.add(paymentId, updatedPayment);
      };
    };
  };

  public shared ({ caller }) func deletePayment(paymentId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete payments");
    };

    switch (payments.get(paymentId)) {
      case null {
        Runtime.trap("Payment not found");
      };
      case (?payment) {
        if (payment.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own payments");
        };

        payments.remove(paymentId);
      };
    };
  };

  public query ({ caller }) func getPaymentsByClient(clientId : Nat) : async [Payment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };

    // Verify client exists and user has access
    switch (clients.get(clientId)) {
      case null {
        Runtime.trap("Client not found");
      };
      case (?client) {
        if (client.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view payments for your own clients");
        };
      };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let clientPayments = List.empty<Payment>();

    payments.values().forEach(
      func(payment) {
        if (payment.clientId == clientId and (isAdmin or payment.owner == caller)) {
          clientPayments.add(payment);
        };
      }
    );

    clientPayments.toArray();
  };

  public query ({ caller }) func getPayment(paymentId : Nat) : async ?Payment {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view payments");
    };

    switch (payments.get(paymentId)) {
      case null { null };
      case (?payment) {
        if (payment.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?payment;
        } else {
          Runtime.trap("Unauthorized: Can only view your own payments");
        };
      };
    };
  };

  public query ({ caller }) func searchPayments(searchTerm : Text) : async [Payment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can search payments");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filteredPayments = List.empty<Payment>();

    payments.values().forEach(
      func(payment) {
        let matchesSearch = payment.method.contains(#text searchTerm) or 
                           payment.notes.contains(#text searchTerm);
        let hasAccess = isAdmin or payment.owner == caller;

        if (matchesSearch and hasAccess) {
          filteredPayments.add(payment);
        };
      }
    );

    filteredPayments.toArray();
  };

  public query ({ caller }) func getPaymentTotalsByClient(clientId : Nat) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view totals");
    };

    // Verify client exists and user has access
    switch (clients.get(clientId)) {
      case null {
        Runtime.trap("Client not found");
      };
      case (?client) {
        if (client.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view totals for your own clients");
        };
      };
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    var total = 0.0;

    payments.values().forEach(
      func(payment) {
        if (payment.clientId == clientId and (isAdmin or payment.owner == caller)) {
          total += payment.amount;
        };
      }
    );

    total;
  };

  public query ({ caller }) func getOverallPaymentTotal() : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view totals");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    var total = 0.0;

    payments.values().forEach(
      func(payment) {
        if (isAdmin or payment.owner == caller) {
          total += payment.amount;
        };
      }
    );

    total;
  };
};
