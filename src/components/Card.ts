import { Component } from './Component';
import { CategoryType } from '../types';
import { ensureElement, handlePrice } from '../utils/utils';
import { CDN_URL } from '../utils/constants';
import { categoryMapping } from '../utils/constants';

interface ICardActions {
	onClick: (event: MouseEvent) => void; // Обработчик клика на карточку
}

export interface ICard {
	id: string; // Уникальный идентификатор карточки
	title: string; // Название товара
	category: string; // Категория товара
	description: string; // Описание товара
	image: string; // Ссылка на изображение товара
	price: number | null; // Цена товара
	selected: boolean; // Статус выбора товара
}

export class Card extends Component<ICard> {
	// Ссылки на внутренние элементы карточки
	protected _title: HTMLElement; // Элемент для названия
	protected _image: HTMLImageElement; // Элемент для изображения
	protected _category: HTMLElement; // Элемент для категории
	protected _price: HTMLElement; // Элемент для цены
	protected _button: HTMLButtonElement; // Кнопка действия

	// Конструктор принимает имя блока, родительский контейнер и объект с колбэк функциями
	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = ensureElement<HTMLImageElement>(
			`.${blockName}__image`,
			container
		);
		this._button = container.querySelector(`.${blockName}__button`);
		this._category = container.querySelector(`.${blockName}__category`);
		this._price = container.querySelector(`.${blockName}__price`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick); // Добавляем обработчик на кнопку
			} else {
				container.addEventListener('click', actions.onClick); // Или на всю карточку
			}
		}
	}

	// Сеттер и геттер для уникального ID
	set id(value: string) {
		this.container.dataset.id = value; // Устанавливаем ID в data-атрибут
	}
	get id(): string {
		return this.container.dataset.id || ''; // Получаем ID из data-атрибута
	}

	// Сеттер и гетер для названия
	set title(value: string) {
		this._title.textContent = value; // Устанавливаем текст названия
	}
	get title(): string {
		return this._title.textContent || ''; // Получаем текст названия
	}

	// Сеттер для картинки
	set image(value: string) {
		// Заменяем любое расширение изображения на .png
		const pngPath = value.replace(/\.(svg|jpg|jpeg|gif|webp)$/i, '.png');
		this._image.src = CDN_URL + pngPath; // Устанавливаем путь к изображению
	}

	// Сеттер для определения выбрали товар или нет
	set selected(value: boolean) {
		if (!this._button.disabled) {
			this._button.disabled = value; // Блокируем кнопку если товар выбран
		}
	}

	// Сеттер для цены
	set price(value: number | null) {
		this._price.textContent = value
			? handlePrice(value) + ' синапсов' // Форматируем цену
			: 'Бесценно'; // Если цена null
		if (this._button && !value) {
			this._button.disabled = true; // Блокируем кнопку если товар бесплатный
		}
	}

	// Сеттер для категории
	set category(value: CategoryType) {
		this._category.textContent = value; // Устанавливаем текст категории
		this._category.classList.add(categoryMapping[value]); // Добавляем класс стиля для категории
	}
}

// Карточка товара в магазине
export class StoreItem extends Card {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
	}
}

// Карточка товара в превью (с описанием)
export class StoreItemPreview extends Card {
	protected _description: HTMLElement; // Элемент для описания

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);

		this._description = container.querySelector(`.${this.blockName}__text`);
	}

	// Сеттер для описания
	set description(value: string) {
		this._description.textContent = value;
	}
}
