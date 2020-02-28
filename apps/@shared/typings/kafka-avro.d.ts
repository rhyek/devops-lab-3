declare module 'kafka-avro' {
  import { Producer } from 'node-rdkafka';

  interface KafkaAvroConstructorOptions {
    kafkaBroker: string;
    schemaRegistry: string;
    topics?: string[];
    shouldFailWhenSchemaIsMissing?: boolean;
  }
  class KafkaAvro {
    constructor(options: KafkaAvroConstructorOptions);
    init(): Promise<void>;
    getProducer(): Promise<Producer>;
  }
  export = KafkaAvro;
}
