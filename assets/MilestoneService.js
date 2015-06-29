(function (init) {
    if (typeof define !== 'undefined' && define.amd) {
        define([], init);
    }
    else {
        window.MilestoneService = init();
    }
})(function () {

    /**
     * @constructor
     */
    function MilestoneService() {}

    /**
     * @param {!Array.<string>} milestoneKeys
     * @return promise - Resolves with a list of Milestone Achievements (progress for given milestones)
     */
    MilestoneService.prototype.getAchievements = function (milestoneKeys) {

        var deferred = Q.defer();

        // resolve immmediately if no milestone keys
        if (!milestoneKeys || milestoneKeys.length === 0) {

            deferred.resolve([]);
            return deferred.promise;
        }

        // query server for achievements
        $.ajax({
            method: "POST",
            url: '/milestone/lookupAchievements.ajax',
            data: {
                milestoneKeys: JSON.stringify(milestoneKeys)
            },
            dataType: 'json'
        })
                .done(function (data) {
                    deferred.resolve(data);
                })
                .fail(function () {
                    deferred.reject("ERROR");
                });

        return deferred.promise;
    };

    /**
     * @param {!object} milestoneProgress Progress update for milestone
     */
    MilestoneService.prototype.updateProgress = function (milestoneProgress) {

        var deferred = Q.defer();

        $.ajax({
            method: "POST",
            url: '/milestone/updateProgress.ajax',
            data: {
                milestoneProgress: JSON.stringify(milestoneProgress)
            },
            dataType: 'json'
        })
                .done(function (data) {
                    deferred.resolve(data);
                })
                .fail(function () {
                    deferred.reject("ERROR");
                });

        return deferred.promise;
    };

    return new MilestoneService();
});