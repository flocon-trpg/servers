import { Injectable } from '@nestjs/common';
import { Observable, Observer, Subject } from 'rxjs';
import { RoomEventPayload } from '../graphql/resolvers/subsciptions/roomEvent/payload';

@Injectable()
export class PubSubService {
    #roomEvent = new Subject<RoomEventPayload>();

    public get roomEvent(): Pick<Observer<RoomEventPayload>, 'next'> &
        Observable<RoomEventPayload> {
        return this.#roomEvent;
    }
}
