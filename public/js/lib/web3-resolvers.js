/**
 * Generic class to get all the ethereum data required to send the transaction
 * @class Web3Resolver
 */
class Web3Resolver {
    constructor(contract, resolvers) {
        this.contract = contract;
        this.resolvers = resolvers;
        this.config = {
            'address': this.contract.options.address,
        };
    }

    /**
     * Resolves all the promises with methodName with arguments
     * @param {*} methodName from Contract.methods[methodName]
     * @param {*} args Arguments which can be passes to contract method
     * @memberof Web3Resolver
     */
    resolveMethods(methodName, args) {
        let promises = {};
        this.resolvers.forEach(resolve => {
            const callback = this.contract.methods[methodName].apply(this, args);
            promises[resolve.name] = callback[resolve.method](resolve.options);
        })
        return promises;
    }


    /**
     * Get transaction config for given methodName and arguments from Contract
     * @param {*} methodName from Contract.methods[methodName]
     * @param {*} args Arguments which can be passes to contract method
     * @returns config Object
     * @memberof Web3Resolver
     */
    async getTransactionConfig(methodName, args) {
        args = args || [];
        const promises = await this.resolveMethods(methodName, args);
        const methodsPromises = Object.keys(promises);
        await Promise.all(methodsPromises.map(async (promise) => {
            this.config[promise] = await promises[promise];
        }));
        return this.config;
    }
}