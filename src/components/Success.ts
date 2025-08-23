import { handlePrice } from '../utils/utils';
import { Component } from './Component';

interface ISuccessActions {
	onClick: (event: MouseEvent) => void; // Обработчик клика
}

export interface ISuccess {
	description: number; // Описание успешного завершения
}

export class Success extends Component<ISuccess> {
	protected _button: HTMLButtonElement; // Кнопка закрытия
	protected _description: HTMLElement; // Элемент для описания

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ISuccessActions // Действия, переданные в конструктор
	) {
		super(container);

		this._button = container.querySelector(`.${blockName}__close`); // Находим кнопку закрытия
		this._description = container.querySelector(`.${blockName}__description`); // Находим элемент описания

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick); // Добавляем обработчик клика на кнопку
			}
		}
	}

	set description(value: number) {
		this._description.textContent =
			'Списано ' + handlePrice(value) + ' синапсов'; // Устанавливаем текст описания
	}
}
