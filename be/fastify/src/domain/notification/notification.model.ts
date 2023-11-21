import mongoose, {Schema, Types} from 'mongoose';

const NotificationModel = new Schema({
   toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User'
   },
   at: Date,
   event: String,
   metadata: Object,
   seen: Boolean
})

export interface INotification {
   _id: Types.ObjectId;
   toUser: Types.ObjectId;
   at: Date;
   event: string;
   metadata: any;
   seen: boolean;
}

export default mongoose.model<INotification>('Notification', NotificationModel);
