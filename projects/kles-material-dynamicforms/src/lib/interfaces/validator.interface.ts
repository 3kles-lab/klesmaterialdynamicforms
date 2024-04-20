
export interface IKlesValidator<T> {
    name: string;
    validator: T;
    message?: string;
    messageKey?:string;
}
