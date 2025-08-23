import './scss/styles.scss';
import { Page } from './components/Page';
import { Api, ApiListResponse } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Modal } from './components/Modal';
import { StoreItem, StoreItemPreview } from './components/Card';
import { AppState, Product } from './components/AppData';
import { ensureElement, cloneTemplate } from './utils/utils';
import { ApiResponse, IOrderForm, IProduct } from './types';
import { API_URL } from './utils/constants';
import { Basket, StoreItemBasket } from './components/Basket';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/Success';

const api = new Api(API_URL); // Создаем экземпляр API с указанным URL
const events = new EventEmitter(); // Создаем экземпляр обработчика событий

// Определяем шаблоны для различных компонентов
const storeProductTemplate =
	ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Создаем модель данных приложения
const appData = new AppState({}, events);

// Инициализируем глобальные контейнеры для страницы и модального окна
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые компоненты для корзины, заказа, контактов и успешного завершения
const basket = new Basket('basket', cloneTemplate(basketTemplate), events);
const order = new Order('order', cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success('order-success', cloneTemplate(successTemplate), {
	onClick: () => {
		events.emit('modal:close'); // Закрываем модальное окно при клике
		modal.close(); // Закрываем модальное окно
	},
});

// Получаем товары с сервера
api
	.get('/product')
	.then((res: ApiResponse) => {
		appData.setStore(res.items as IProduct[]); // Устанавливаем товары в состояние приложения
	})
	.catch((err) => {
		console.error(err); // Логируем ошибку при получении данных
	});

// Обработчик изменения элементов каталога
events.on('items:changed', () => {
	page.store = appData.store.map((item) => {
		const product = new StoreItem(cloneTemplate(storeProductTemplate), {
			onClick: () => events.emit('card:select', item), // Обработка клика по карточке товара
		});
		return product.render({
			id: item.id,
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
});

// Обработка открытия карточки товара
events.on('card:select', (item: Product) => {
	page.locked = true; // Блокируем страницу при открытии карточки
	const product = new StoreItemPreview(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('card:toBasket', item); // Добавляем товар в корзину
		},
	});
	modal.render({
		content: product.render({
			id: item.id,
			title: item.title,
			image: item.image,
			category: item.category,
			description: item.description,
			price: item.price,
			selected: item.selected,
		}),
	});
});

// Обработка добавления товара в корзину
events.on('card:toBasket', (item: Product) => {
	item.selected = true;
	appData.addToBasket(item);
	page.counter = appData.getBasketAmount();
	modal.close();
});

// Обработка открытия корзины
events.on('basket:open', () => {
	page.locked = true;
	const basketItems = appData.basket.map((item, index) => {
		const storeItem = new StoreItemBasket(
			'card',
			cloneTemplate(cardBasketTemplate),
			{
				onClick: () => events.emit('basket:delete', item), // Обработка удаления товара из корзины
			}
		);
		return storeItem.render({
			title: item.title,
			price: item.price,
			index: index + 1,
		});
	});
	modal.render({
		content: basket.render({
			list: basketItems,
			price: appData.getTotalBasketPrice(), // Указываем общую цену корзины
		}),
	});
});

// Обработка удаления товара из корзины
events.on('basket:delete', (item: Product) => {
	appData.deleteFromBasket(item.id);
	item.selected = false;
	basket.price = appData.getTotalBasketPrice();
	page.counter = appData.getBasketAmount();
	basket.refreshIndices();
	if (!appData.basket.length) {
		basket.disableButton();
	}
});

// Обработка оформления заказа
events.on('basket:order', () => {
	modal.render({
		content: order.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Обработка изменения состояния валидации заказа
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
	const { payment, address } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Обработка изменения состояния валидации контактов
events.on('contactsFormErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Обработка изменения введенных данных
events.on(
	'orderInput:change',
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Обработка заполнения телефона и почты
events.on('order:submit', () => {
	appData.order.total = appData.getTotalBasketPrice(); // Устанавливаем общую сумму заказа
	appData.setItems();
	modal.render({
		content: contacts.render({
			valid: false,
			errors: [],
		}),
	});
});

// Обработка покупки товаров
events.on('contacts:submit', () => {
	api
		.post('/order', appData.order)
		.then((res) => {
			events.emit('order:success', res);
			appData.clearBasket();
			appData.refreshOrder();
			order.disableButtons();
			page.counter = 0;
			appData.resetSelected();
		})
		.catch((err) => {
			console.log(err);
		});
});

// Обработка успешного завершения заказа
events.on('order:success', (res: ApiListResponse<string>) => {
	modal.render({
		content: success.render({
			description: res.total, // Указываем общую сумму заказа в модальном окне
		}),
	});
});

// Обработка закрытия модального окна
events.on('modal:close', () => {
	page.locked = false; // Разблокируем страницу
	appData.refreshOrder(); // Обновляем состояние заказа
});
