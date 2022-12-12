<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @input="inputValidation()"
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <template v-if="inputValidation().length">
          <div
            class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
          >
            <span
              v-for="n of inputValidation()"
              :key="n"
              @click="handleAddTicker(n)"
              class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
            >
              {{ n }}
            </span>
          </div>
        </template>
        <div v-if="checkInput" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add" type="button" class="my-4" />
  </section>
</template>

<script>
import AddButton from './AddButton.vue';
import { getCoinlist } from '../api';
export default {
  components: {
    AddButton,
  },

  props: {
    tickers: Array,
  },

  data() {
    return {
      ticker: '',
      coinlist: [],
    };
  },

  created() {
    setImmediate(async () => {
      const coinlistData = await getCoinlist();

      for (let n in coinlistData.Data) {
        this.coinlist.push(n);
      }
    });
  },

  computed: {
    checkInput() {
      let flagTicker = false;
      for (let t of this.tickers) {
        if (this.ticker.toUpperCase() == t.name) {
          return (flagTicker = true);
        }
      }
      return flagTicker;
    },
  },

  methods: {
    add() {
      if (this.ticker.length === 0) {
        return;
      }

      if (this.checkInput) {
        return;
      }

      this.$emit('add-ticker', this.ticker);
      this.ticker = '';
    },

    inputValidation() {
      // дз, подскажет 4 из списока монеток по начальному вводу
      // выдает ошибку если вставить в компутед
      if (!this.ticker) {
        return false;
      }

      const nameHint = this.coinlist.filter((item) =>
        item.startsWith(this.ticker.toUpperCase())
      );

      return nameHint.filter((item, idx) => idx < 4);
    },

    handleAddTicker(nameTickerToAdd) {
      this.ticker = nameTickerToAdd;
    },
  },
};
</script>
