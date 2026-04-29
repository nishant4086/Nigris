cd /Users/nishantrankawat/Nigris/server
npx autocannon -c 100 -d 20 http://localhost:8000/api/productsnpx autocannon -c 50 -d 20 \
  -H "Authorization: Bearer <TOKEN>" \
  -m GET \
  http://localhost:8000/api/products# Nigris