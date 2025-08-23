import { Component } from './Component';
import { ensureElement } from './../utils/utils';
import { IEvents } from './base/events';

interface IModalData {
	content: HTMLElement; // Содержимое модального окна
}

export class Modal extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement; // Кнопка закрытия модального окна
	protected _content: HTMLElement; // Элемент для содержимого модального окна

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container // Находим кнопку закрытия
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container); // Находим элемент для содержимого

		this._closeButton.addEventListener('click', this.close.bind(this)); // Добавляем обработчик закрытия
		this.container.addEventListener('click', this.close.bind(this)); // Закрываем при клике вне содержимого
		this._content.addEventListener('click', (event) => event.stopPropagation()); // Останавливаем всплытие клика внутри содержимого
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value); // Устанавливаем новое содержимое
	}

	open() {
		this.container.classList.add('modal_active'); // Открываем модальное окно
		this.events.emit('modal:open'); // Генерируем событие открытия
	}

	close() {
		this.container.classList.remove('modal_active'); // Закрываем модальное окно
		this.content = null; // Очищаем содержимое
		this.events.emit('modal:close'); // Генерируем событие закрытия
	}

	render(data: IModalData): HTMLElement {
		super.render(data); // Вызываем рендер родительского класса
		this.open(); // Открываем модальное окно
		return this.container; // Возвращаем контейнер модального окна
	}
}
