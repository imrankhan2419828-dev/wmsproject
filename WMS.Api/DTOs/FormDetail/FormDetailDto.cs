public class FormDetailDto
{
    public int FormID { get; set; }
    public string? FormName { get; set; }
    public string? FormTitle { get; set; }
    public string? FormCategory { get; set; }
    public int? CategoryOrder { get; set; }
    public int? FormOrder { get; set; }
    public string? MenuTitle { get; set; }
    public string? MenuSubTitle { get; set; }
    public int? MenuOrder { get; set; }
    public bool? IsWebPage { get; set; }
    public int? ParentPage { get; set; }
    public string? MenuIcon { get; set; }
}
