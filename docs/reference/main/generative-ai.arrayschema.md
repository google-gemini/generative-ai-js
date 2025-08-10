# ArraySchema Interface

Represents the schema for array responses.

Note: The properties `minItems` and `maxItems` are not currently supported by the API. Attempting to use these properties will result in an error.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| items | Schema | The schema for array items |
| type | SchemaType.ARRAY | Must be SchemaType.ARRAY |


