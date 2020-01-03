import { EntityRepository, Repository } from "typeorm";
import { MessageEntity } from "../entities/MessageEntity";
//import { Message } from "../Message";

@EntityRepository(MessageEntity)
export class MessageRepository extends Repository<MessageEntity> {

}
