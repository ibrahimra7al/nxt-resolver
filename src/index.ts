export = function(babel) {
  var t = babel.types;
  const FunctionsSharedVisitor = function(path, state) {
    const isWidget = state.file.opts.filename && state.file.opts.filename.includes('widgets');
    let foundUseDropZone = false;
    if (path.node.params.length || !isWidget)
      return;
    path.traverse({
      CallExpression: function(path) {
        let doesCallExpressionUseDropZone = false;
        path.traverse({
          Identifier: function(path) {
            if (path.node.name !== 'useDropzoneData') return;
            doesCallExpressionUseDropZone = true;
          }
        })

        if (!doesCallExpressionUseDropZone || path.node.arguments.length > 0)
          return;
        foundUseDropZone = true;
        let newExpression = t.callExpression(path.node.callee, [
            t.identifier("dropzone"),
            t.identifier("order")
          ]);
        newExpression = t.tsAsExpression(
          newExpression, 
          t.tsAnyKeyword()
        );
        path.replaceWith(newExpression);
      }
    });
    if (!foundUseDropZone) return;
    var newFunction = t.arrowFunctionExpression([
      t.objectPattern([
        t.objectProperty(t.identifier("dropzone"), t.identifier("dropzone")),
        t.objectProperty(t.identifier("order"), t.identifier("order")),
      ])
    ], path.node.body);
    path.replaceWith(newFunction);
    path.skip();
  }
  return {
    name: "nxt-transform",
    visitor: {
      ArrowFunctionExpression: FunctionsSharedVisitor,
      FunctionExpression: FunctionsSharedVisitor
    }
  };
};