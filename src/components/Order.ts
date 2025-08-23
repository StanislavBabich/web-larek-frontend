import { IEvents } from './base/events';
import { Form } from './Form';

//Интерфейс, описывающий окно оформления заказа
export interface IOrder {
	address: string;
	payment: string;
}

//Класс, описывающий окно оформления заказа
export class Order extends Form<IOrder> {
	protected _card: HTMLButtonElement;
	protected _cash: HTMLButtonElement;

	// Конструктор принимает имя блока, родительский элемент и обработчик событий
	constructor(
		protected blockName: string,
		container: HTMLFormElement,
		protected events: IEvents
	) {
		super(container, events);

		this._card = container.elements.namedItem('card') as HTMLButtonElement;
		this._cash = container.elements.namedItem('cash') as HTMLButtonElement;

		// Обработчик клика для кнопки "Наличными"
		if (this._cash) {
			this._cash.addEventListener('click', () => {
				this._cash.classList.add('button_alt-active'); // Подсвечиваем кнопку
				this._card.classList.remove('button_alt-active'); // Убираем подсветку с другой кнопки
				this.onInputChange('payment', 'cash'); // Устанавливаем способ оплаты
			});
		}

		// Обработчик клика для кнопки "Картой"
		if (this._card) {
			this._card.addEventListener('click', () => {
				this._card.classList.add('button_alt-active'); // Подсвечиваем кнопку
				this._cash.classList.remove('button_alt-active'); // Убираем подсветку с другой кнопки
				this.onInputChange('payment', 'card'); // Устанавливаем способ оплаты
			});
		}
	}

	// Метод, отключающий подсветку кнопок
	disableButtons() {
		this._cash.classList.remove('button_alt-active'); // Убираем подсветку с кнопки "Наличными"
		this._card.classList.remove('button_alt-active'); // Убираем подсветку с кнопки "Картой"
	}
}
