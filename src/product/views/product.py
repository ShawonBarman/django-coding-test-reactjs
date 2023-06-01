from django.views import generic
from django.core.paginator import Paginator
from product.models import *
from django.db.models import Q


class CreateProductView(generic.TemplateView):
    template_name = 'products/create.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        variants = Variant.objects.filter(active=True).values('id', 'title')
        context['product'] = True
        context['variants'] = list(variants.all())
        return context


class ProductListView(generic.TemplateView):
    template_name = 'products/list.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        request = self.request  # Retrieve the request object
        # Retrieve the filter values from the request's GET parameters
        title = request.GET.get('title')
        variant = request.GET.get('variant')
        price_from = request.GET.get('price_from')
        price_to = request.GET.get('price_to')
        date = request.GET.get('date')

        # Build the filter query dynamically based on the filter values
        filters = Q()
        if title:
            filters &= Q(title__icontains=title)
        if variant:
            filters &= Q(variants__variant_title=variant)
        if price_from:
            filters &= Q(variants__price__gte=float(price_from))
        if price_to:
            filters &= Q(variants__price__lte=float(price_to))
        if date:
            filters &= Q(created_at=date)

        # Apply the filters to retrieve the filtered products
        products_filter = Product.objects.filter(filters)
        
        products = Product.objects.all()
        paginate_by = 10

        product_data = []
        variant_groups = {}
        for product in products:
            variants = ProductVariant.objects.filter(product=product)
            variant_data = []
            for variant in variants:
                variant_prices = ProductVariantPrice.objects.filter(product=variant.product)
                # print(variant_prices)
                variant_price_data = []
                for variant_price in variant_prices:
                    variant_title = ""
                    if variant_price.product_variant_one:
                        variant_title += variant_price.product_variant_one.variant_title + " / "

                    if variant_price.product_variant_two:
                        variant_title += variant_price.product_variant_two.variant_title + " / "
                    else:
                        # Remove the last '/' from variant_title if it exists
                        variant_title = variant_title.rstrip(" / ")
                        
                    if variant_price.product_variant_three:
                        variant_title += variant_price.product_variant_three.variant_title
                    else:
                        # Remove the last '/' from variant_title if it exists
                        variant_title = variant_title.rstrip(" / ")
                    
                    variant_price_data.append({
                        'variant_title': variant_title,
                        'price': variant_price.price,
                        'stock': variant_price.stock
                    })
                    
                    variant_group = variant.variant.title
                    variant_options = []
                    if variant_price.product_variant_one and variant.variant.title == 'Size':
                        variant_options.append(variant_price.product_variant_one.variant_title)
                    if variant_price.product_variant_two and variant.variant.title == 'Color':
                        variant_options.append(variant_price.product_variant_two.variant_title)
                    if variant_price.product_variant_three and variant.variant.title == 'Style':
                        variant_options.append(variant_price.product_variant_three.variant_title)

                    variant_groups.setdefault(variant_group, []).extend(variant_options)
                    
            for variant in variants:
                variant_groups[variant.variant.title] = list(set(variant_groups[variant.variant.title]))
            
            variant_data.append({
                'title': variant_group,
                'options': variant_options
            })
            
            product_data.append({
                'title': product.title,
                'created_at': product.created_at,
                'description': product.description,
                'variants': variant_price_data
            })
            
        # Paginate the products
        paginator = Paginator(products, paginate_by)
        page_number = self.request.GET.get('page')
        products_page = paginator.get_page(page_number)

        context['products'] = product_data
        context['variants'] = variant_groups
        context['products_page'] = products_page
        context['products_filter'] = products_filter
            
        return context
    
    