/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
 class TransactionsPage {
   /**
    * Если переданный элемент не существует,
    * необходимо выкинуть ошибку.
    * Сохраняет переданный элемент и регистрирует события
    * через registerEvents()
    * */
   constructor(element) {
     if (!element) {
       throw new Error("Невалидное значение для TransactionsWidget");
     }

     this.element = element;
     this.registerEvents();
     this.lastOptions;
   }

   /**
    * Вызывает метод render для отрисовки страницы
    * */
   update() {
     this.render(this.lastOptions);
     /*В случае, если метод render() был ранее вызван с какими-то опциями, при вызове update() эти опции необходимо передать повторно 
		<- каким образом это можно проверить?*/
   }

   /**
    * Отслеживает нажатие на кнопку удаления транзакции
    * и удаления самого счёта. Внутри обработчика пользуйтесь
    * методами TransactionsPage.removeTransaction и
    * TransactionsPage.removeAccount соответственно
    * */
   //button.btn-danger
   registerEvents() {
    this.element.querySelector('.remove-account').addEventListener('click', () => {
      this.removeAccount();
    });

    this.element.querySelector('.content').addEventListener('click', (e) => {
      const element = e.target.closest('button.transaction__remove');
      if (element) {
        this.removeTransaction(element.dataset.id);
      };
    });
  };
   /**
    * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
    * Если пользователь согласен удалить счёт, вызовите
    * Account.remove, а также TransactionsPage.clear с
    * пустыми данными для того, чтобы очистить страницу.
    * По успешному удалению необходимо вызвать метод App.updateWidgets(),
    * либо обновляйте только виджет со счетами
    * для обновления приложения
    * */
    removeAccount() {
      if (this.lastOptions){
        if ( window.confirm('Вы действительно хотите удалить счёт?')){
          const id = this.lastOptions.account_id
          Account.remove( {id}, (err, response) => {
            if (response && response.success){
              this.clear();
              App.update();
            } else {
              console.log('removeAccount:', err)
            }
          });
        };
      };
    };

   /**
    * Удаляет транзакцию (доход или расход). Требует
    * подтверждеия действия (с помощью confirm()).
    * По удалению транзакции вызовите метод App.update(),
    * либо обновляйте текущую страницу (метод update) и виджет со счетами
    * */
   removeTransaction(id) {
     if (window.confirm("Вы действительно хотите удалить эту транзакцию?")) {
       Transaction.remove(
         {
           id: id,
         },
         (err, response) => {
           if (response && response.success) {
             App.update();
           }
         }
       );
     }
   }

   /**
    * С помощью Account.get() получает название счёта и отображает
    * его через TransactionsPage.renderTitle.
    * Получает список Transaction.list и полученные данные передаёт
    * в TransactionsPage.renderTransactions()
    * */
    render(options){
      if (!options) {
        return;
      }
      Account.get(options.account_id, (error, response) => {
        if (error) {
          throw new Error(error);
        }
        if (!response.success) {
          return;
        }
        this.renderTitle(response.data.name);
      });
      Transaction.list(options, (error, response) => {
        if (error) {
          throw new Error(error);
        }  
        if (!response.success) {
          return;
        }
        this.renderTransactions(response.data);
      });
      this.lastOptions = options;
    }

   /**
    * Очищает страницу. Вызывает
    * TransactionsPage.renderTransactions() с пустым массивом.
    * Устанавливает заголовок: «Название счёта»
    * */
   clear() {
     this.renderTransactions();
     this.renderTitle("Название счёта");
   }

   /**
    * Устанавливает заголовок в элемент .content-title
    * */
   renderTitle(name) {
     const accName = document.querySelector(".content-title");
     accName.textContent = "";
     accName.insertAdjacentText("afterbegin", name);
   }

   /**
    * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
    * в формат «10 марта 2019 г. в 03:20»
    * */
   formatDate(date) {
     return new Intl.DateTimeFormat("ru-RU", {
       dateStyle: "long",
       timeStyle: "short",
     })
       .format(Date.parse(date))
       .replace(",", " в");
   }

   /**
    * Формирует HTML-код транзакции (дохода или расхода).
    * item - объект с информацией о транзакции
    * */
    getTransactionHTML(item){
      return `
      <div class="transaction transaction_${item.type} row">
        <div class="col-md-7 transaction__details">
          <div class="transaction__icon">
              <span class="fa fa-money fa-2x"></span>
          </div>
          <div class="transaction__info">
              <h4 class="transaction__title">${item.name}</h4>
              <div class="transaction__date">${this.formatDate(item.created_at)}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="transaction__summ">
              ${item.sum} <span class="currency">₽</span>
          </div>
        </div>
        <div class="col-md-2 transaction__controls">
            <button class="btn btn-danger transaction__remove" data-id="${item.id}">
                <i class="fa fa-trash"></i>  
            </button>
        </div>
      </div>
      `;
    }

   /**
    * Отрисовывает список транзакций на странице
    * используя getTransactionHTML
    * */
    renderTransactions(data){
      const content = this.element.querySelector(".content");
      if (data){
        content.innerHTML = data.reduce( (result, item) => {
          return result + this.getTransactionHTML(item);
        },
        '');
      } else {
        console.log('renderTransactions, data is empty')
      };
    };
  };