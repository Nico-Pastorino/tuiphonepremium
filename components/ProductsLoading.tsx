import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-0 shadow-sm rounded-xl sm:rounded-2xl">
          <div className="aspect-square">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <Skeleton className="h-3 sm:h-4 w-3/4" />
            <Skeleton className="h-2 sm:h-3 w-full" />
            <Skeleton className="h-2 sm:h-3 w-2/3" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 sm:h-10 flex-1" />
              <Skeleton className="h-8 sm:h-10 w-8 sm:w-10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
