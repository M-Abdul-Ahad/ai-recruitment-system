from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination for API list endpoints.
    Allows clients to override page size via `?page_size=X` up to 100.
    Allows unpaginated raw lists if client explicitly passes `?paginate=false`.
    """
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        if request.query_params.get("paginate") == "false":
            return None
        return super().paginate_queryset(queryset, request, view=view)

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "total_pages": self.page.paginator.num_pages,
            "current_page": self.page.number,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })

