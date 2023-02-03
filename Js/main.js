let eventBus = new Vue()
Vue.component('product-details'
    , {
        props: {
            details: {
                type: Array,
                required: true,
            }
        },
        template:
            `<ul>
                        <li v-for="detail in details">{{detail}}</li>
                    </ul>`,


    }
)


Vue.component('product', {
    template: `
   <div class="product">
	<div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description}}</p>
            <p v-if="inStock">In stock</p>
            <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
            <p class = "style-text" style="text-decoration: line-through"v-else>Out of stock</p>
            <p><a :href=" link ">More products like this</a></p>
            <span v-if="inventory >= 50">{{ sale }}</span>
   
            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @mouseover="updateProduct(index)"
            ></div>
            <ul>
                <li v-for="sizes in sizes">{{ sizes }}</li>
            </ul>
 
            <button
                    v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
            >
                Add to cart
            </button>
          <button 
              v-on:click="deleteFromCart">Delete</button>

 
            
        </div>
           <div>  <product-tabs :reviews="reviews" :shipping="shipping" :details="details"></product-tabs>
        </div>
        </div>
 `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            altText: "A pair of socks",
            description: "A pair of warm, fuzzy socks",
            inventory: 100,
            OnSale: "Выгодные цены только сегодня и только сейчас!",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }

            ], sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],



            selectedVariant: 0,
            reviews: [],
        }
    },
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },

    methods: {
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        addToCart() {
            this.$emit('add-to-cart',
                this.variants[this.selectedVariant].variantId);
        },
        deleteFromCart() {
            this.$emit('delete-from-cart', this.variants[this.selectedVariant].variantId);
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            return this.brand + ' ' + this.product + ' ' + this.OnSale
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    }
})


Vue.component('product-review', {
    template: `
   <form class="review-form" @submit.prevent="onSubmit">
   <p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>
    <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
    </p>
     <p>
       <label for="review">Review:</label>
       <textarea id="review" v-model="review"></textarea>
     </p>
    
     <p>
       <label for="rating">Rating:</label>
       <select id="rating" v-model.number="rating">
         <option>5</option>
         <option>4</option>
         <option>3</option>
         <option>2</option>
         <option>1</option>
       </select>
       
       <input type="radio" id="yes" value="Recommend" v-model="recommend" class="button">
       <label for="yes">Recommend</label>
       <input type="radio" id="no" value=" Not recommend" v-model="recommend" class="button">
       <label for="no">Not recommend</label>
     <p>
       <input type="submit" value="Submit"> 
     </p>
</form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: [],
        }
    },
    methods: {
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend,
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(this.recommend) this.errors.push("Recommendation required.")
            }
        }
    }
})
Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true,
        }
    },
    template: `
   <ul>
        <li v-for="detail in details">{{ detail }}</li>
   </ul>
 `
})
Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
   <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       <div v-show="selectedTab === 'Shipping'">
            <p>{{ shipping }}</p>
        </div>
        <div v-show="selectedTab === 'Details'">
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
        </div>
     </div>
 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',
        }
    },
})


let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);

        },
        deleteCart(id) {
            for(let i = this.cart.length - 1; i >= 0; i--){
                if (this.cart[i] === id){
                    this.cart.splice(i, 1);
                }
            }
        }
    }
})
