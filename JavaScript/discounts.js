//loading modules
var fs = require("fs");

//Load custumers and products if 

function getDiscount(){
	if(fs.existsSync('data/customers.json') && fs.existsSync('data/products.json')){
		var customers = JSON.parse(fs.readFileSync('data/customers.json', 'utf8'));
		var products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

		// console.log(customers.toString());
		// console.log(products.toString());


		//fucntion to get the the customer or the product of the selected id.

		function getClientProducts(id, option){
			if(option){
				for(var i = 0 ; i < Object.keys(customers).length ; i++){
					if(id == customers[i]['id']){
						return customers[i];
					}
				}
			}
			else{
				for(var i = 0 ; i < Object.keys(products).length ; i++){
					if(id == products[i]['id']){
						return products[i];
					}
				}
			}
		}



		var i = 1; //variable used to get all the order in the loop while


		var orders_with_discount = []; // array used to store the order with the discounts
		
		while(fs.existsSync('data/order'+i+'.json')){
			var order = JSON.parse(fs.readFileSync('data/order'+i+'.json', 'utf8')); // get all the orders

			var discount = 0; // variable used to get the total of all discounts
			var quantity_products_id1 = 0; // variable used to ocunt how many products of id 1 there is in one order.
			var description = ''; // variable used to write a description of all disocunts applied


			var client  = getClientProducts(order['customer-id'], 1); // get the customer that ordered the order
			//determine if the first discound is appliable
			if( client['revenue'] > 1000){
				discount += order['total']*0.10;
				description += '10% discount to customers who already bought for over € 1000. ';
			}

			var lower_unit_price = 0; // variable used to get the unit with the lowest price of the category 1

			//loop to get cycle through all items in a order
			for(var j = 0; j < Object.keys(order['items']).length; j++){
				var product = getClientProducts(order['items'][j]['product-id'], 0); //get the product id of the item

				//determine if the second discount is appliable
				if(product['category'] == 2 && order['items'][j]['quantity']>= 5){
					var quantityFree = Math.floor(order['items'][j]['quantity']/5);
					order['items'][j]['quantity'] = parseInt(order['items'][j]['quantity']) +' + '+ Math.floor(order['items'][j]['quantity']/5);
					description += "Free " + quantityFree + " of product " + order['items'][j]['product-id'] + '. ';
				}

				//check if the unit as lowest price
				if(j == 0)
					lower_unit_price = order['items'][j]['unit-price'];
				 else if(lower_unit_price < order['items'][j]['unit-price'] )
				 	lower_unit_price = order['items'][j]['unit-price'];

				//counter to determine how many products of category 1 there is
				if(product['category'] == 1)
					quantity_products_id1++;

			}	


			//determine if the thrid discound is appliable
			if(quantity_products_id1 >=2){
				discount += lower_unit_price*0.20;
				description = '20% discount on the cheapest product.'
			}

			//add the description, the total of discounts and the the total already with the dsicount to the order
			order['description'] = description;
			order['discount'] = discount.toFixed(2);
			order['total with discount'] = (order['total'] - discount).toFixed(2);


			orders_with_discount.push(order); // store the order in an array of orders.

			i++;
		}

		//display all the order with the discount already applied
		for(var i = 0; i < Object.keys(orders_with_discount).length; i++){
			console.log('\nSTART ORDER');
			console.log(orders_with_discount[i]);
			console.log('\nEND ORDER');
		}

		//write in a new document json all the orders with the disocunt applied
		orders_with_discount = JSON.stringify(orders_with_discount);
		fs.writeFile('data/ordersWithDiscount.json', orders_with_discount);
	}
}

//run the function getDiscounts to aplply the discounts to the orders
getDiscount();

