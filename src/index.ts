import { AxiosInstance } from "axios";

const MethodProxy = (queryName: string) => ({
    async apply(_target: { [x: string]: any }, _prop: any, args: any) {
        const method = queryName.slice(1);
        const body = {
            method: method,
            args: args,
        };

        const res = await _target._instance.post("", body, {
            headers: {
                "Content-Type": "application/json",
                userID: "asd",
            },
        });
        return res.data;
    },

    get(_target: { [x: string]: any }, prop: any): any {
        if (prop === Symbol.toPrimitive) {
            return _target;
        }

        const func = () => {};
        func._instance = _target._instance;

        return new Proxy(func, MethodProxy(`${queryName}.${prop}`));
    },
});

type Unflatten<T> = {} & {
    [Property in keyof T as Exclude<Property, `${string}.${string}`>]: T[Property];
} & {
    [Property in keyof T as ParentOf<Property>]: Id<
        Unflatten<{
            [ChildProperty in ChildOf<Property>]: T[`${ParentOf<Property>}.${ChildProperty}` &
                keyof T];
        }>
    >;
};

type ParentOf<T> = T extends `${infer Parent}.${string}` ? Parent : never;
type ChildOf<T> = T extends `${string}.${infer Child}` ? Child : never;

type Id<T> = {} & {
    [P in keyof T]: T[P];
};

type GroupedAPIContract<T> = Id<Unflatten<T>>;
type APIContractGeneric = Record<string, Function>;

export function CreateAPIClient<T extends APIContractGeneric>(
    instance: AxiosInstance
): GroupedAPIContract<T> {
    const obj = new Proxy(
        {
            _instance: instance,
        },
        MethodProxy("")
    );
    return obj as GroupedAPIContract<T>;
}
