import { View, Text, FlatList, useWindowDimensions, ActivityIndicator, StyleSheet } from "react-native";
//import products from '../assets/products.json'
import ProductListItem from '../components/ProductListItem'
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { listProducts } from "@/api/products";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';


export default function HomeScreen() {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        map: {
            width: '100%',
            height: '100%',
        },
    });
    const [coordinate, setCoordinate] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
    });
 
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
    if (isLoading) {
        return (<ActivityIndicator />);
    }
    if (error) {
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
        // <View style={styles.container}>
        //     <MapView style={styles.map}
        //         //provider={PROVIDER_GOOGLE}
        //         onPress={(e) => {
        //             console.log("Coordinates", e.nativeEvent);
        //             setCoordinate(e.nativeEvent.coordinate);
        //         }}>
        //         <Marker
        //             coordinate={coordinate}
        //             title="My Location"
        //             description="This is a marker in San Francisco"
        //         />
        //     </MapView>
        // </View>
    );
}
