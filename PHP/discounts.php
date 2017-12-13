<?php 
	//load customers and products
	if(file_exists('data/customers.json') && file_exists('data/products.json')){
		
		$customers = file_get_contents('data/customers.json');
		$customers = json_decode($customers, true);

		$products = file_get_contents('data/products.json');
		$products = json_decode($products, true);
	}


	//function used to get the customer or products selected by the id
	function getClientProducts($id, $obj){

		for($i = 0 ; $i < count($obj) ; $i++){
			if($id == $obj[$i]['id']){
				return $obj[$i];
			}
		}
	
	}

	$i = 1; //variable used to get all orders

	while(file_exists('data/order'.$i.'.json')){
		$order = file_get_contents('data/order'.$i.'.json');
		$order = json_decode($order, true);

		$discount = 0; //variable used to get the total of the discounts applied

		$quantity_products_id1 = 0; // variable used to ocunt how many products of id 1 there is in one order.
		$description = ''; // variable used to write a description of all disocunts applied


		$client  = getClientProducts($order['customer-id'], $customers); // get the customer that ordered the order
			//determine if the first discound is appliable
		if( $client['revenue'] > 1000){
			$discount += $order['total']*0.10;
			$description .= '10% discount to customers who already bought for over 1000 euros. ';
		}

		$lower_unit_price = 0; // variable used to get the unit with the lowest price of the category 1

		//loop to get cycle through all items in a order
		for($j = 0; $j < count($order['items']); $j++){
			$product = getClientProducts($order['items'][$j]['product-id'], $products); //get the product id of the item

			//determine if the second discount is appliable
			if($product['category'] == 2 && $order['items'][$j]['quantity']>= 5){
				$quantityFree = floor($order['items'][$j]['quantity']/5);
				$order['items'][$j]['quantity'] = intval($order['items'][$j]['quantity']) .' + '. floor($order['items'][$j]['quantity']/5);
				$description .= "Free " . $quantityFree . " of product " . $order['items'][$j]['product-id'] . '. ';
			}

			//check if the unit as lowest price
			if($j == 0)
				$lower_unit_price = $order['items'][$j]['unit-price'];
			else if($lower_unit_price < $order['items'][$j]['unit-price'] )
			 	$lower_unit_price = $order['items'][$j]['unit-price'];

			//counter to determine how many products of category 1 there is
			if($product['category'] == 1)
				$quantity_products_id1++;

		}	


		//determine if the thrid discound is appliable
		if($quantity_products_id1 >=2){
			$discount += $lower_unit_price*0.20;
			$description .= '20% discount on the cheapest product.';
		}

		//add the description, the total of discounts and the the total already with the dsicount to the order
		$order['description'] = $description;
		$order['discount'] = round($discount,2);
		$order['total with discount'] = round($order['total'] - $discount, 2);


		$orders_with_discount[] = $order; // store the order in an array of orders.

		

		$i++;

	}

	$orders_with_discount = json_encode($orders_with_discount, JSON_PRETTY_PRINT);


	//write to a new file json all the orders already with the discount 

	$fp = fopen("data/ordersWithDiscount.json", "w");
	fwrite($fp, $orders_with_discount);
	fclose($fp);


	//display all the order with the discount already applied
	echo "<pre>";
	print_r($orders_with_discount);
	echo "</pre>";







?>