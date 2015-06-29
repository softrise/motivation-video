(function (init) {
    if (typeof define !== 'undefined' && define.amd) {
        define(['humane', 'jquery'], init);
    }
    else {
        window.notifications = init(window.humane, window.$);
    }
})(function (humane, $) {
    /**
     * @constructor
     */
    function RemilonNotification() {

        /**
         * @constant
         * @type {number}
         * @private
         */
        this._DEFAULT_TIMEOUT = 4000;
    }

    /**
     * Displays an informational notification
     * @param {String} message
     * @param {number} [timeout] display timeout override in milliseconds
     */
    RemilonNotification.prototype.info = function (message, timeout) {
        this._showNotification(message, 'humane-remilon-info', timeout);
    };

    /**
     * Displays a success notification
     * @param {String} message
     * @param {number} [timeout] display timeout override in milliseconds
     */
    RemilonNotification.prototype.success = function (message, timeout) {
        this._showNotification(message, 'humane-remilon-success', timeout);
    };

    /**
     * Displays an error notification
     * @param {String} message
     * @param {number} [timeout] display timeout override in milliseconds
     */
    RemilonNotification.prototype.error = function (message, timeout) {
        this._showNotification(message, 'humane-remilon-error', timeout);
    };

    /**
     *
     * @param {String} message
     * @param {String} cssClass
     * @param {number} [timeout] display timeout override in milliseconds
     * @private
     */
    RemilonNotification.prototype._showNotification = function (message, cssClass, timeout) {

        if (!timeout) {
            timeout = this._DEFAULT_TIMEOUT;
        }

        humane.create({addnCls: cssClass, timeout: timeout}).log(message);
    };

    var remNotificationService = new RemilonNotification();

    /**
     * document ready
     */
    $(document).ready(function () {

        $('#remilonNotification-info').each(function () {

            var message = $(this).data('message');
            var timeout = $(this).data('timeout');

            remNotificationService.info(message, timeout);
        });

        $('#remilonNotification-success').each(function () {

            var message = $(this).data('message');
            var timeout = $(this).data('timeout');

            remNotificationService.success(message, timeout);
        });

        $('#remilonNotification-error').each(function () {

            var message = $(this).data('message');
            var timeout = $(this).data('timeout');

            remNotificationService.error(message, timeout);
        });
    });

    return remNotificationService;
});