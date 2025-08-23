import { IProduct } from '../types';
import { handlePrice } from '../utils/utils';
import { Component } from './Component';
import { IEvents } from './base/events';

//Интерфейс, описывающий корзину товаров
export interface IBasket {
	// Массив элементов li с товаром
	list: HTMLElement[];
	// Общая цена товаров
	price: number;
}

//Класс, описывающий корзину товаров
export class Basket extends Component<IBasket> {
	// Ссылки на внутренние элементы
	protected _list: HTMLElement; // Список товаров
	protected _price: HTMLElement; // Элемент для общей цены
	protected _button: HTMLButtonElement; // Кнопка оформления заказа

	// Конструктор принимает имя блока, родительский элемент и обработчик событий
	constructor(
		protected blockName: string,
		container: HTMLElement,
		protected events: IEvents
	) {
		super(container);

		this._button = container.querySelector(`.${blockName}__button`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._list = container.querySelector(`.${blockName}__list`);

		if (this._button) {
			this._button.addEventListener('click', () =>
				this.events.emit('basket:order')
			); // Обработчик оформления заказа
		}
	}

	// Сеттер для общей цены
	set price(price: number) {
		this._price.textContent = handlePrice(price) + ' синапсов';
	}

	// Сеттер для списка товаров
	set list(items: HTMLElement[]) {
		this._list.replaceChildren(...items); // Заменяем список товаров
		this._button.disabled = items.length ? false : true; // Блокируем кнопку если корзина пуста
	}

	// Метод отключающий кнопку "Оформить"
	disableButton() {
		this._button.disabled = true;
	}

	// Метод для обновления индексов таблички при удалении товара из корзины
	refreshIndices() {
		Array.from(this._list.children).forEach(
			(item, index) =>
				(item.querySelector(`.basket__item-index`)!.textContent = (
					index + 1
				).toString())
		);
	}
}

// Интерфейс для товара в корзине
export interface IProductBasket extends IProduct {
	id: string;
	index: number;
}

// Действия для товара в корзине
export interface IStoreItemBasketActions {
	onClick: (event: MouseEvent) => void;
}

// Карточка товара в корзине
export class StoreItemBasket extends Component<IProductBasket> {
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: IStoreItemBasketActions
	) {
		super(container);

		this._title = container.querySelector(`.${blockName}__title`);
		this._index = container.querySelector(`.basket__item-index`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._button = container.querySelector(`.${blockName}__button`);

		if (this._button) {
			this._button.addEventListener('click', (evt) => {
				this.container.remove(); // Удаляем элемент из DOM
				actions?.onClick(evt); // Вызываем обработчик
			});
		}
	}

	// Сеттер для названия
	set title(value: string) {
		this._title.textContent = value;
	}

	// Сеттер для индекса
	set index(value: number) {
		this._index.textContent = value.toString();
	}

	// Сеттер для цены
	set price(value: number) {
		this._price.textContent = handlePrice(value) + ' синапсов';
	}
}
