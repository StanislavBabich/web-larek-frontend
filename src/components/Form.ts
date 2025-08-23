import { Component } from './Component';
import { IEvents } from './base/events';
import { ensureElement } from './../utils/utils';

interface IFormState {
	valid: boolean; // Статус валидности формы
	errors: string[]; // Массив ошибок
}

export class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement; // Кнопка отправки формы
	protected _errors: HTMLElement; // Элемент для отображения ошибок
	protected _inputs: NodeListOf<HTMLInputElement>; // Все поля ввода формы

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container // Находим кнопку отправки
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);
		this._inputs = this.container.querySelectorAll('input');

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit('orderInput:change', {
			// Генерируем событие изменения ввода
			field,
			value,
		});
	}

	// Метод для очистки всех полей формы
	public clear(): void {
		this._inputs.forEach((input) => {
			input.value = '';
		});
		this.setText(this._errors, '');
	}

	set valid(value: boolean) {
		this.setDisabled(this._submit, !value); // Используем метод setDisabled из Component
	}

	set errors(value: string) {
		this.setText(this._errors, value); // Устанавливаем текст ошибок
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}
