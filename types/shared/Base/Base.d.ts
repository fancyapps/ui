/**
 * Base class, all components inherit from this class
 */
export class Base {
    /**
     * Base constructor
     * @param {Object} [options] - Options as `key: value` pairs
     */
    constructor(options?: any);
    options: any;
    plugins: any[];
    events: {};
    /**
     * Retrieve option value by key, supports subkeys
     * @param {String} key Option name
     * @param {*} [fallback] Fallback value for non-existing key
     * @returns {*}
     */
    option(key: string, fallback?: any, ...rest: any[]): any;
    /**
     * Simple l10n support - replaces object keys
     * found in template with corresponding values
     * @param {String} str String containing values to localize
     * @param {Array} params Substitute parameters
     * @returns {String}
     */
    localize(str: string, params?: any[]): string;
    /**
     * Subscribe to an event
     * @param {String} name
     * @param {Function} callback
     * @returns {Object}
     */
    on(name: string, callback: Function): any;
    /**
     * Subscribe to an event only once
     * @param {String} name
     * @param {Function} callback
     * @returns {Object}
     */
    once(name: string, callback: Function): any;
    /**
     * Unsubscribe event with name and callback
     * @param {String} name
     * @param {Function} callback
     * @returns {Object}
     */
    off(name: string, callback: Function): any;
    /**
     * Emit an event.
     * If present, `"*"` handlers are invoked after name-matched handlers.
     * @param {String} name
     * @param  {...any} details
     * @returns {Boolean}
     */
    trigger(name: string, ...details: any[]): boolean;
    /**
     * Add given plugins to this instance,
     * this will end up calling `attach` method of each plugin
     * @param {Object} Plugins
     * @returns {Object}
     */
    attachPlugins(plugins: any): any;
    /**
     * Remove all plugin instances from this instance,
     * this will end up calling `detach` method of each plugin
     * @returns {Object}
     */
    detachPlugins(): any;
}
