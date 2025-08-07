class Paginator {
  constructor(
    model,
    query,
    options = { orderBy: { created_at: "desc" } },
    searchs = []
  ) {
    this.model = model;
    this.query = query;
    this.options = options;
    this.searchs = searchs;
  }

  async paginate(limit = 2) {
    let data = [];
    let total = 0;
    const page = parseInt(this.query.page) || 1;
    const offset = (page - 1) * limit;

    const where =
      this.searchs.length > 0 && this.query?.search?.trim() !== ""
        ? {
            OR: this.searchs.map((search) => ({
              [search]: {
                contains: this.query.search ?? "",
              },
            })),
          }
        : {};

    try {
      [data, total] = await Promise.all([
        this.model.findMany({
          where,
          take: limit,
          skip: offset,
          ...this.options,
        }),
        this.model.count({ where }),
      ]);
    } catch (error) {
      console.error("Error during pagination:", error);
      throw new Error("Failed to paginate data");
    }
    return {
      data,
      pagination: {
        total_items: limit,
        current_page: page,
        pages: this.generatePages(
          Math.ceil(total / limit),
          parseInt(this.query.page)
        ),
        total_page: Math.ceil(total / limit),
        next_page: page < Math.ceil(total / limit) ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
      },
    };
  }

  generatePages(totalPages, currentPage = 1) {
    let pages = [];
    //  jika totalPages kurang dari 10, tampilkan semua halaman
    if (totalPages <= 10) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i + 1);
      }
    } else {
      // selalu ambil page 1 dan 2
      pages.push(1);
      pages.push(2);

      // Tampilkan "..." jika currentPage cukup jauh dari awal (lebih dari halaman 6)
      if (currentPage > 6) {
        pages.push("...");
      }
      // Tampilkan rentang halaman di sekitar currentPage
      let lengthPage;
      if (currentPage <= 6) {
        lengthPage = 9;
      } else if (currentPage >= totalPages - 5) {
        lengthPage = totalPages; // tampilkan sampai halaman terakhir
      } else {
        lengthPage = currentPage + 3; // tampilkan 3 halaman setelah currentPage
      }
      for (
        let i = Math.max(3, currentPage - 3); // mulai dari halaman 3 lebih kecil dari currentPage
        i <= lengthPage;
        i++
      ) {
        pages.push(i);
      }

      // Tampilkan "..." jika currentPage cukup jauh dari akhir (kurang dari totalPages - total -6 )
      if (currentPage < totalPages - 6) {
        pages.push("...");
      }
      // jika halaman cukup jauh dari akhir, tampilkan halaman terakhir
      if (currentPage < totalPages - 5) {
        pages.push(totalPages - 1);
        pages.push(totalPages);
      }
    }
    return pages;
  }
}

export default Paginator;
