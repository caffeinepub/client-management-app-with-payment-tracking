import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Payment {
    id: bigint;
    method: string;
    clientId: bigint;
    owner: Principal;
    date: Time;
    notes: string;
    amount: number;
}
export interface Client {
    id: bigint;
    owner: Principal;
    name: string;
    email: string;
    notes: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addClient(name: string, email: string, phone: string, notes: string): Promise<bigint>;
    addPayment(clientId: bigint, amount: number, date: Time, method: string, notes: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteClient(clientId: bigint): Promise<void>;
    deletePayment(paymentId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(clientId: bigint): Promise<Client | null>;
    getClients(): Promise<Array<Client>>;
    getOverallPaymentTotal(): Promise<number>;
    getPayment(paymentId: bigint): Promise<Payment | null>;
    getPaymentTotalsByClient(clientId: bigint): Promise<number>;
    getPaymentsByClient(clientId: bigint): Promise<Array<Payment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchClients(searchTerm: string): Promise<Array<Client>>;
    searchPayments(searchTerm: string): Promise<Array<Payment>>;
    updateClient(clientId: bigint, name: string, email: string, phone: string, notes: string): Promise<void>;
    updatePayment(paymentId: bigint, amount: number, date: Time, method: string, notes: string): Promise<void>;
}
