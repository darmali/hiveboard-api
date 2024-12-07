const API_URL =  process.env.EXPO_PUBLIC_PAI_URL;

export async function listProducts(){
    console.log(`${API_URL}/products`);
    const res = await fetch(`${API_URL}/products`);
    if(!res.ok){
        throw new Error('Error: '); 
    }
    const data = await res.json();

    return data;
}

export async function fetchProductById(id: string){
    console.log(`${API_URL}/products/${id}`);
    const res = await fetch(`${API_URL}/products/${id}`);
    if(!res.ok){
        throw new Error('Error: '); 
    }
    const data = await res.json();

    return data;
}