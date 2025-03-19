router.get('/returns', getReturnRequests);
router.post('/returns/:orderId/items/:itemId/:action', handleReturnRequest);