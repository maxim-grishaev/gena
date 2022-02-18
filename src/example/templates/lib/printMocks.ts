/* eslint-disable no-unused-vars, camelcase */
// const getRandomInt = (maxVal = 10) => Math.floor(Math.random() * maxVal)
// const getRandomNumber = (maxPower = 5) =>
//   Math.random() * Math.pow(10, Math.ceil(Math.random() * maxPower))
// const getRandomString = () => (Math.random() + Date.now()).toString(36)
// const getRandomBoolean = () => Math.random() > 0.5

// const t = {
//   null: (def) => null,
//   object: (def) => ({}),
//   undefined: (def) => undefined,
//   integer: (def) => getRandomInt(def.maximum),
//   number: (def) => getRandomNumber(),
//   string: (def) =>
//     String(
//       def.example || def.description || 'Random String ' + getRandomString(),
//     ),
//   boolean: (def) => getRandomBoolean(),
//   //
//   array: (getInnerType) => Array.from({ length: 3 }).map(getInnerType),
//   enum: (values) => values[getRandomInt(values.length)],
// }

// t.object = (keyType = t.string, valueType = t.string) => ({ [keyType()]: valueType() })

// <% for (const { modelName, definition, props } of VARS.models) { %>
//   <% if (props) { %>
// const <%= HELP.convertModelName(modelName) %> = () => ({
//     <% for (const [propName, propDefinition] of Object.entries(props)) { %>
//   <%= JSON.stringify(propName) %>: <%= HELP.getType(propDefinition, [modelName, propName]) %>,
//     <% } %>
// });
//   <% } else { %>
/*
Unknown type (not a model):
<%= JSON.stringify(definition, null, 2) %>
*/
// const <%= modelName %> = <%= HELP.getType(definition, [modelName]) %>;
//   <% } %>
// <% } %>

// <% for (const enumItem of VARS.enums) { %>
// /**
//  * <%= HELP.jsCommentMultiline(enumItem.definition.description) %>
//  */
// const <%= HELP.getEnumName(enumItem) %> = () => t.enum(<%= JSON.stringify(enumItem.definition.enum) %>);
// <% } %>

// module.exports = {
// <% for (const enumItem of VARS.enums) { %>
//   <%= HELP.getEnumName(enumItem) %>,
// <% } %>
// <% for (const { modelName } of VARS.models) { %>
//   <%= HELP.convertModelName(modelName) %>,
// <% } %>
// };
