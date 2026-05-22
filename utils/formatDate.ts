import { format } from 'date-fns';

export const formatDate = (dateString: Date) => {
    return format(dateString, 'dd-MM-yyyy');
};
