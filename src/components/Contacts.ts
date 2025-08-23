import { IEvents } from './base/events';
import { Form } from './Form';

//Интерфейс, описывающий окно ввода контактной информации
export interface IContacts {
	phone: string;
	email: string;
}

// Класс, описывающий окно ввода контактной информации
export class Contacts extends Form<IContacts> {
	// Конструктор принимает родительский элемент и обработчик событий
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events); // Вызываем конструктор родительского класса
	}
}
