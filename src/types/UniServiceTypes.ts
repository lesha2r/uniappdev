export interface IUniServiceOptions {
    name: string;
    Model: any;
    db: any;
    schema?: any;
    serviceSettings: any;
    methods: any;
    methodsAllowed: string[];
}