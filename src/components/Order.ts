import { IEvents } from './base/events';
import { Form } from './Form';

// Интерфейс, описывающий окно оформления заказа
export interface IOrder {
	address: string;
	payment: string;
}

// Класс, описывающий окно оформления заказа
export class Order extends Form<IOrder> {
	protected _card: HTMLButtonElement;
	protected _cash: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLFormElement,
		protected events: IEvents
	) {
		super(container, events);

		this._card = container.elements.namedItem('card') as HTMLButtonElement;
		this._cash = container.elements.namedItem('cash') as HTMLButtonElement;

		if (this._cash) {
			this._cash.addEventListener('click', () => {
				this.toggleClass(this._cash, 'button_alt-active', true);
				this.toggleClass(this._card, 'button_alt-active', false);
				this.onInputChange('payment', 'cash');
			});
		}

		if (this._card) {
			this._card.addEventListener('click', () => {
				this.toggleClass(this._card, 'button_alt-active', true);
				this.toggleClass(this._cash, 'button_alt-active', false);
				this.onInputChange('payment', 'card');
			});
		}
	}

	// Метод для очистки формы заказа (переопределяем базовый метод)
	public clear(): void {
		super.clear(); // Очищаем базовые поля
		this.disableButtons(); // Сбрасываем выделение кнопок оплаты
	}

	// Метод, отключающий подсветку кнопок
	disableButtons(): void {
		this.toggleClass(this._cash, 'button_alt-active', false);
		this.toggleClass(this._card, 'button_alt-active', false);
	}
}
