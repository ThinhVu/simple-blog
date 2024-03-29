import {Types} from 'mongoose';
import dayjs from "dayjs";

/**
 * Parse any value to Types.ObjectId
 * @param v input value
 * @param errorMessage if true, an Error will be thrown. Otherwise, null will be returned.
 */
const objectId = (v: any, errorMessage = 'Invalid object id'): Types.ObjectId | undefined => {
   if (!v) {
      if (errorMessage)
         throw new Error(errorMessage)
      else
         return
   }
   return new Types.ObjectId(v)
}

/**
 * parse any value to number with fallback
 * @param v
 * @param fallbackValue
 */
const number = (v: any, fallbackValue: number): number => +v || fallbackValue;

/**
 * Parse any value to false, accept all falsy values such as 0, false, '' and also null, undefined, '0', 'false', 'False', 'FALSE', ..
 * @param v input value
 */
const bool = (v: any): boolean => !(v == false || v == undefined || (typeof(v) === 'string' && (v == '0' || v.toLowerCase() === 'false')));

const date = (v: any): Date => dayjs(v).toDate();

const str = (v: any): string => (v && v.toString()) || "";

export default {
   objectId,
   number,
   bool,
   date,
   str
}
