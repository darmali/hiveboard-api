import '@/global.css';
import { Link, Stack } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Icon } from '@/components/ui/icon';
import { LogOutIcon, ShoppingCart, User } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useCart } from '@/store/cartStore';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/store/authStore';
import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const cartItemsNum = useCart((state) => state.items.length);
  const isLoggedIn = useAuth((s) => !!s.token);
  const setUser = useAuth((s) => s.setUser);
  const setToken = useAuth((s) => s.setToken);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
        <GluestackUIProvider>
          <Stack
            screenOptions={{
              headerRight: () =>
                <HStack>
                {!isLoggedIn ? (
                    <Link href={'/login'} asChild>
                      <Pressable className="flex-row gap-2">
                        <Icon as={User} />
                      </Pressable>
                    </Link>
                  ) :
                  (

                    <Button size="sm" className="p-3.5" variant='outline' onPress={logout}>
                    <ButtonIcon as={LogOutIcon} />
                    </Button>
                  )}
                  {cartItemsNum > 0 && (
                  <Link href={'/carts'} asChild>
                    <Pressable className="flex-row gap-2">
                      <Icon as={ShoppingCart} />
                      <Text>{cartItemsNum}</Text>
                    </Pressable>
                  </Link>
                )}
                </HStack>,
            }}
          >
            <Stack.Screen name="index" options={{ title: 'Shop' }} />
            <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
          </Stack>
        </GluestackUIProvider>
    </QueryClientProvider>
  );
}
