import { IEvents } from './base/events';

//Базовая модель, чтобы отличать её от простых объектов с данными
export abstract class Model<T> {
	constructor(data: Partial<T>, protected events: IEvents) {
		Object.assign(this, data); // Копируем данные в модель
	}

	emitChanges(event: string, payload?: object) {
		this.events.emit(event, payload ?? {}); // Генерируем событие с данными
	}
}
