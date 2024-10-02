'use strict';

var FilePathModule = require('@flocon-trpg/core');
var utils = require('@flocon-trpg/utils');
var result = require('@kizahasi/result');
var immer = require('immer');
var lodash = require('lodash');
var PerformRollCallFailureType = require('../../../../enums/PerformRollCallFailureType.js');

const maxRollCallHistoryCount = 3;
const minimumTimeWindow = 60000;
const performRollCall = (source, myUserUid, soundEffect) => {
    const me = source.participants?.[myUserUid];
    switch (me?.role) {
        case FilePathModule.Master:
        case FilePathModule.Player:
            break;
        default:
            return result.Result.error(PerformRollCallFailureType.PerformRollCallFailureType.NotAuthorizedParticipant);
    }
    const openRollCall = FilePathModule.getOpenRollCall(source.rollCalls ?? {});
    if (openRollCall != null) {
        return result.Result.error(PerformRollCallFailureType.PerformRollCallFailureType.HasOpenRollCall);
    }
    const maxCreatedAt = lodash.maxBy(utils.recordToArray(source.rollCalls ?? {}), ({ value }) => value.createdAt)?.value.createdAt;
    if (maxCreatedAt != null) {
        const elapsed = new Date().getTime() - maxCreatedAt;
        if (elapsed < minimumTimeWindow) {
            return result.Result.error(PerformRollCallFailureType.PerformRollCallFailureType.TooManyRequests);
        }
    }
    const result$1 = immer.produce(source, source => {
        const openRollCall = FilePathModule.getOpenRollCall(source.rollCalls ?? {});
        if (openRollCall != null) {
            return;
        }
        const key = FilePathModule.simpleId();
        if (source.rollCalls == null) {
            source.rollCalls = {};
        }
        utils.recordToArray(source.rollCalls)
            .slice(maxRollCallHistoryCount)
            .forEach(({ key }) => {
            if (source.rollCalls == null) {
                return;
            }
            source.rollCalls[key] = undefined;
        });
        source.rollCalls[key] = {
            $v: 1,
            $r: 1,
            createdAt: new Date().getTime(),
            createdBy: myUserUid,
            participants: {
                [myUserUid]: {
                    $v: 1,
                    $r: 1,
                    answeredAt: new Date().getTime(),
                },
            },
            closeStatus: undefined,
            soundEffect,
        };
    });
    return result.Result.ok(result$1);
};

exports.performRollCall = performRollCall;
//# sourceMappingURL=performRollCall.js.map
