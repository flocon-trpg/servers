'use strict';

var tslib = require('tslib');
var core = require('@mikro-orm/core');
var uuid = require('uuid');
require('../../enums/ParticipantRoleType.js');
var entity = require('../room/entity.js');
var entity$1 = require('../user/entity.js');

exports.Participant = class Participant {
    constructor() {
        this.id = uuid.v4();
    }
};
tslib.__decorate([
    core.PrimaryKey(),
    tslib.__metadata("design:type", String)
], exports.Participant.prototype, "id", void 0);
tslib.__decorate([
    core.Property({ type: 'string', index: true, nullable: true }),
    tslib.__metadata("design:type", String)
], exports.Participant.prototype, "role", void 0);
tslib.__decorate([
    core.Property({ nullable: true }),
    tslib.__metadata("design:type", String)
], exports.Participant.prototype, "name", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity.Room, { ref: true }),
    tslib.__metadata("design:type", Object)
], exports.Participant.prototype, "room", void 0);
tslib.__decorate([
    core.ManyToOne(() => entity$1.User, { ref: true }),
    tslib.__metadata("design:type", Object)
], exports.Participant.prototype, "user", void 0);
exports.Participant = tslib.__decorate([
    core.Entity(),
    core.Unique({ properties: ['room', 'user'] })
], exports.Participant);
//# sourceMappingURL=entity.js.map
