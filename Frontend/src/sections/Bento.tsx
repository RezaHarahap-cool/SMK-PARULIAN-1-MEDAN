export default function Bento(){
    return(
        <section className="w-full min-h-screen bg-[#f5f5f5] px-6 py-20">
  <div className="max-w-7xl mx-auto">


    {/* Bento Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* BIG CARD */}
      <div className="lg:col-span-3 bg-white rounded-3xl p-10 shadow-sm">
        <div className="grid md:grid-cols-3 gap-10">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi enim numquam quidem exercitationem molestias similique quam culpa quia. Sapiente, expedita sequi? Nesciunt, tenetur odit fuga omnis atque dolorum temporibus, aliquam incidunt cumque aliquid deserunt officia provident facere. Distinctio earum maiores dolore vitae, nam nesciunt eligendi!
            </p>

        </div>
      </div>

      {/* SMALL CARD */}
      <div className="bg-black text-white rounded-3xl p-10 flex flex-col justify-between">

        <div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/685/685655.png"
            alt=""
            className="w-24 invert"
          />
        </div>

        <div className="space-y-5">
          <h2 className="text-3xl font-bold">
            Creative Editing
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Premium editing services that transform raw footage into
            cinematic visual masterpieces.
          </p>

          <button className="mt-4 px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition">
            Explore More
          </button>
        </div>
      </div>

    </div>
  </div>
</section>
    )
}