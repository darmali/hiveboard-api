import { createOrder } from "@/api/orders";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCart } from "@/store/cartStore";
import { Mutation, useMutation } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { MountainSnow } from "lucide-react-native";
import { FlatList } from "react-native";

export default function Carts() {
    const items = useCart((state: any) => state.items);
    const resetCart = useCart((state: any) => state.resetCart);
    const createOrderMutation = useMutation({
        mutationFn: () => createOrder(items.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
        }))),
        onSuccess: (data) => {
            console.log('Success: ', data);
            resetCart();

        },
        onError: () => {
            console.log('Error');
        },
    });
    const onCheckout = async () => {
        createOrderMutation.mutate();
    };

    if (items.length === 0) {
        return <Redirect href={"/"} />
    }
    return (
        <FlatList
            data={items}
            contentContainerClassName="gap-2 max-w-[960px] w-full mx-auto p-2"
            renderItem={({ item }) => (
                <HStack className="bg-white p-3">
                    <VStack space="sm">
                        <Text bold>{item.product.name}</Text>
                        <Text>$ {item.product.price}</Text>
                    </VStack>
                    <Text className="ml-auto">{item.quantity}</Text>
                </HStack>
            )}
            ListFooterComponent={() => (
                <Button onPress={onCheckout}>
                    <ButtonText>Checkout</ButtonText>
                </Button>
            )}
        />
    );
}