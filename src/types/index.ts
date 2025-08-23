// Типы категорий товаров
export type CategoryType =
	| 'другое'
	| 'софт-скил'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скил';

// Маппинг категорий товаров
export type CategoryMapping = {
	[Key in CategoryType]: string;
};

// Ошибки форм
export type FormErrors = Partial<Record<keyof IOrderForm, string>>;

// Интерфейс ответа API
export interface ApiResponse {
	items: IProduct[];
	total?: number;
}

//  Интерфейс, описывающий поля товара в магазине
export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: CategoryType;
	price: number | null;
	selected: boolean;
}

// Интерфейс, описывающий поля заказа товара
export interface IOrder {
	items: string[];
	payment: string;
	total: number | null;
	address: string;
	email: string;
	phone: string;
}

export interface IOrderForm {
	payment: string;
	address: string;
	email: string;
	phone: string;
}

// Интерфейс, описывающий внутреннее состояние приложения
export interface IAppState {
	basket: IProduct[];
	store: IProduct[];
	order: IOrder;
	formErrors: FormErrors;
	addToBasket(value: IProduct): void;
	deleteFromBasket(id: string): void;
	clearBasket(): void;
	getBasketAmount(): number;
	getTotalBasketPrice(): number;
	setItems(): void;
	setOrderField(field: keyof IOrderForm, value: string): void;
	validateContacts(): boolean;
	validateOrder(): boolean;
	refreshOrder(): void;
	setStore(items: IProduct[]): void;
	resetSelected(): void;
}

// Интерфейс для событий изменения данных
export interface IDataChangeEvent<T> {
	eventName: string;
	data?: T;
}

// Интерфейс для обработчиков событий
export interface IEventHandlers {
	[key: string]: (...args: any[]) => void;
}
