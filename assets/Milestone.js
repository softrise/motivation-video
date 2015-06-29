(function (init) {
    if (typeof define !== 'undefined' && define.amd) {
        define(['milestoneService', 'toastr'], init);
    }
    else{
        window.milestone = new init(window.MilestoneService, window.toastr);
    }
})(function (MilestoneService, toastr) {
        'use strict';

        /**
         * Created by dseltzer on 4/03/2015.
         * @constructor
         */
        function Milestone() {

            /**
             * @type MilestoneService
             */
            this._milestoneService = MilestoneService;
            this._loadError = false;
            this._updateError = false;

            this._milestoneKeysOnPage = [];

            /**
             * Milestone key to toast options
             * @type {object.<string, object>}
             */
            this._toastOptions = {};

            /**
             * Milestone key to list of elements
             * @type {object.<string, Array.<object>>}
             */
            this._popoverElements = {};

            /**
             * @type {object.<string, object>}
             */
            this._achievements = {};

            // init
            this._findMilestoneKeysOnPage();
            this.loadAchievements(this._milestoneKeysOnPage);
        }

        /**
         * Load achievements for the given milestones
         * @param {!Array.<string>} milestoneKeys
         * @private
         */
        Milestone.prototype.loadAchievements = function (milestoneKeys) {

            var promise = this._milestoneService.getAchievements(milestoneKeys);
            promise.then($.proxy(this._achievementsLoaded, this),

                    $.proxy(function () {
                        this._loadError = true;
                    }, this));
        };

        /**
         * Send the progress update to the server and reload the milestone's achievement
         * @param {!object} milestoneProgress a fully built milestone progress object to send to the server
         */
        Milestone.prototype.updateProgress = function (milestoneProgress) {

            var milestoneKey = milestoneProgress.milestone.key;

            var promise = this._milestoneService.updateProgress(milestoneProgress);

            promise.then(
                    $.proxy(this.loadAchievements, this, [milestoneKey]),

                    $.proxy(function () {
                        this._updateError = true;
                    }, this));
        };

        /**
         * Helper method for updating progress for count type milestones
         * @param {!string} milestoneKey key of milestone to update progress for
         * @param {!string} dataKey unique key to use for the stone data
         */
        Milestone.prototype.updateProgressForCountMilestone = function (milestoneKey, dataKey) {

            // make sure dataKey is a string
            dataKey = '' + dataKey;

            var milestoneProgress = {
                milestone: {
                    key: milestoneKey
                },
                stoneList: [
                    {
                        data: {
                            "key": dataKey
                        }
                    }
                ],
                override: false
            };

            this.updateProgress(milestoneProgress);
        };

        /**
         * Locate all milestone data tags on page and populate the list of milestone keys
         * @private
         */
        Milestone.prototype._findMilestoneKeysOnPage = function () {

            var milestoneElementesOnPage = $('*[data-milestone]');

            // de-dupe milestone keys
            var milestoneKeysSet = {};
            $.each(milestoneElementesOnPage, $.proxy(function (index, milestoneElement) {

                var $milestoneElement = $(milestoneElement);

                var milestoneKey = $milestoneElement.data('milestone');
                milestoneKeysSet[milestoneKey] = true;

                // toast notification options
                var type = $milestoneElement.data('milestone-type');

                // toast
                if (type === 'toast') {

                    this._toastOptions[milestoneKey] = {

                        title: $milestoneElement.data('milestone-title'),
                        message: $milestoneElement.html(),

                        type: $milestoneElement.data('milestone-toast-type'),
                        positionClass: $milestoneElement.data('milestone-toast-position'),

                        closeButton: true
                    };
                }
                // popover
                else if (type === 'popover') {

                    var popoverElementArray = this._popoverElements[milestoneKey];
                    if (!popoverElementArray) {
                        popoverElementArray = [];
                        this._popoverElements[milestoneKey] = popoverElementArray;
                    }

                    popoverElementArray.push($milestoneElement);
                }

            }, this));

            // put keys into a list
            $.each(milestoneKeysSet, $.proxy(function (milestoneKey) {
                this._milestoneKeysOnPage.push(milestoneKey);
            }, this));
        };

        /**
         * Update achievement status's with the recently loaded achievements
         * @param {!Array.<object>} achievements
         * @private
         */
        Milestone.prototype._achievementsLoaded = function (achievements) {
            this.error = false;

            // update achievements
            $.each(achievements, $.proxy(function (index, achievement) {

                var milestoneKey = achievement.milestone.key;
                this._achievements[milestoneKey] = achievement;

                // todo remspect test here (remove check after it wins)
                if (!remspect.isControl('milestone')) {

                    if (achievement.status === 'COMPLETED_NOW') {

                        // trigger toasts
                        var toastOptions = this._toastOptions[milestoneKey];
                        if (toastOptions) {

                            if ('success' === toastOptions.type) {
                                toastr.success(toastOptions.message, toastOptions.title, toastOptions);
                            }
                            else if ('info' === toastOptions.type) {
                                toastr.info(toastOptions.message, toastOptions.title, toastOptions);
                            }
                            else if ('warning' === toastOptions.type) {
                                toastr.warning(toastOptions.message, toastOptions.title, toastOptions);
                            }
                            else if ('error' === toastOptions.type) {
                                toastr.error(toastOptions.message, toastOptions.title, toastOptions);
                            }
                        }

                        // trigger popovers
                        var popoverElements = this._popoverElements[milestoneKey];
                        if (popoverElements) {

                            $.each(popoverElements, $.proxy(function (index, element) {
                                element.popover('show');
                            }, this));
                        }
                    }
                }

            }, this));
        };

    return new Milestone();
});