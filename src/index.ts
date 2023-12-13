import axios from "axios";

const MethodProxy = (queryName: string) => ({
    async apply(_target: { [x: string]: any }, _prop: any, args: any) {
        const method = queryName.slice(1);
        const body = {
            method: method,
            args: args,
        };

        const res = await axios.post(_target._path, body, {
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
        func._path = _target._path;

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

type GroupedAPIContract<T> = Id<Unflatten<T>> & {
    _path: string;
};
type APIContractGeneric = Record<string, Function>;

const handler = {
    get(target: { [x: string]: any }, prop: string, _receiver: any): any {
        if (typeof target[prop] === "object" && target[prop] !== null) {
            return new Proxy(() => {}, handler);
        }
        return function () {
            console.log(prop);
        };
    },
};

export function CreateAPIClient<T extends APIContractGeneric>(path: string): GroupedAPIContract<T> {
    const obj = new Proxy(
        {
            _path: path,
        },
        MethodProxy("")
    );
    return obj as GroupedAPIContract<T>;
}
