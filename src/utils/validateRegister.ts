import { CredentialOptions } from '../resolvers/CredentialOptions';

export const validateRegister = (options: CredentialOptions) => {
    const { username, email, password } = options;

    if(username.length <= 2){
        return [{
            field: 'username',
            message: 'Username has to be more than 2 characters'
        }];
    }

    if(!username.match(/^\w+$/)){
        return [{
            field: 'username',
            message: 'Username should contain alphanumeric characters and underscore'
        }];
    }

    if(password.length <= 2){
        return [{
            field: 'password',
            message: 'Password has to be more than 2 characters'
        }];
    }

    if(!email.includes('@')){
        return [{
            field: 'email',
            message: 'Invalid email'
        }];
    }

    return null;
}