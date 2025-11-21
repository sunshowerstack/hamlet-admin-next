const TokenKey = 'Admin-Token';

// const tokenStorage = useStorage<null | string>(TokenKey, null);

export const getToken = () => localStorage.getItem(TokenKey);

export const setToken = (access_token: string) => (localStorage.setItem(TokenKey,access_token));

export const removeToken = () => ( localStorage.removeItem(TokenKey) );
