import { IOrder, IProduct, FormErrors, IOrderForm } from '../types';
import { Model } from './Model';
import { IAppState } from '../types';

// Модель товара
export class Product extends Model<IProduct> {
	id: string; // ID товара
	description: string; // Описание товара
	image: string; // Ссылка на изображение
	title: string; // Название товара
	category: string; // Категория товара
	price: number | null; // Цена товара
	selected: boolean; // Статус выбора
}

//Класс, описывающий состояние приложения
export class AppState extends Model<IAppState> {
	// Корзина с товарами
	basket: Product[] = [];
	// Массив со всеми товарами
	store: Product[];

	// Объект заказа клиента
	order: IOrder = {
		items: [], // ID товаров в заказе
		payment: '', // Способ оплаты
		total: null, // Общая сумма
		address: '', // Адрес доставки
		email: '', // Email
		phone: '', // Телефон
	};

	// Объект с ошибками форм
	formErrors: FormErrors = {};

	// Добавление товара в корзину
	addToBasket(value: Product) {
		this.basket.push(value);
	}

	// Удаление товара из корзины
	deleteFromBasket(id: string) {
		this.basket = this.basket.filter((item) => item.id !== id);
	}

	// Очистка корзины
	clearBasket() {
		this.basket.length = 0;
	}

	// Получение количества товаров в корзине
	getBasketAmount() {
		return this.basket.length;
	}

	// Установка ID товаров в заказ
	setItems() {
		this.order.items = this.basket.map((item) => item.id);
	}

	// Установка значений полей заказа
	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order); // Уведомляем о готовности контактов
		}
		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order); // Уведомляем о готовности заказа
		}
	}

	// Валидация контактных данных
	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('contactsFormErrors:change', this.formErrors); // Уведомляем об ошибках
		return Object.keys(errors).length === 0; // Возвращаем статус валидности
	}

	// Валидация данных заказа
	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		if (!this.order.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
		this.formErrors = errors;
		this.events.emit('orderFormErrors:change', this.formErrors); // Уведомляем об ошибках
		return Object.keys(errors).length === 0; // Возвращаем статус валидности
	}

	// Очистка заказа
	refreshOrder() {
		this.order = {
			items: [],
			total: null,
			address: '',
			email: '',
			phone: '',
			payment: '',
		};
	}

	// Получение общей стоимости корзины
	getTotalBasketPrice() {
		return this.basket.reduce((sum, next) => sum + next.price, 0);
	}

	// Установка данных магазина
	setStore(items: IProduct[]) {
		this.store = items.map(
			(item) => new Product({ ...item, selected: false }, this.events)
		);
		this.emitChanges('items:changed', { store: this.store });
	}

	// Сброс статуса выбора у всех товаров
	resetSelected() {
		this.store.forEach((item) => (item.selected = false));
	}
}
