import { View, Text, FlatList, useWindowDimensions, ActivityIndicator } from "react-native";
//import products from '../assets/products.json'
import ProductListItem from '../components/ProductListItem'
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { listProducts } from "@/api/products";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";


export default function HomeScreen() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: listProducts,
    });

    const numColumns = useBreakpointValue({
        default: 2,
        md: 2,
        lg: 3,
        '2xl': 4
    })
    if(isLoading){
        return(<ActivityIndicator />);
    }
    if(error){
        return (<Text> Error Fetching Products</Text>);
    }
    return (
        <FlatList
            key={numColumns}
            data={data}
            numColumns={numColumns}
            contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full"
            columnWrapperClassName="gap-2"
            renderItem={({ item }) => <ProductListItem product={item} />}
        />
    );
}